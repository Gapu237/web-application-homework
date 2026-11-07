
export type ReservationStatus =
  | "reserved"
  | "checked_out"
  | "expired"
  | "cancelled";

export interface Product {
  id: string;
  name: string;
  price: number;
  initialStock: number;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
}

export interface Reservation {
  id: string;
  productId: string;
  quantity: number;
  status: ReservationStatus;
  createdAt: number;
  expiresAt: number;
}

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: string;
  message: string;
}

export interface EngineSnapshot {
  products: Product[];
  reservations: Reservation[];
  auditLog: AuditEvent[];
}

export class FlashSaleEngine {
  private products = new Map<string, Product>();
  private reservations = new Map<string, Reservation>();
  private auditLog: AuditEvent[] = [];

  constructor(products: Product[]) {
    for (const product of products) {
      if (
        product.initialStock < 0 ||
        !Number.isInteger(product.initialStock) ||
        product.price < 0
      ) {
        throw new Error(`Invalid product: ${product.id}`);
      }

      if (this.products.has(product.id)) {
        throw new Error(`Duplicate product ID: ${product.id}`);
      }

      this.products.set(product.id, {
        ...product,
        availableStock: product.initialStock,
        reservedStock: 0,
        soldStock: 0,
      });
    }
  }

  private record(type: string, message: string): void {
    this.auditLog.push({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      message,
    });
  }

  getSnapshot(): EngineSnapshot {
    return {
      products: [...this.products.values()].map((p) => ({ ...p })),
      reservations: [...this.reservations.values()].map((r) => ({
        ...r,
      })),
      auditLog: this.auditLog.map((event) => ({ ...event })),
    };
  }

  private expireReservations(now: number): void {
    for (const reservation of this.reservations.values()) {
      if (
        reservation.status !== "reserved" ||
        reservation.expiresAt > now
      ) {
        continue;
      }

      const product = this.products.get(reservation.productId);

      if (!product) continue;

      product.reservedStock -= reservation.quantity;
      product.availableStock += reservation.quantity;
      reservation.status = "expired";

      this.record(
        "RESERVATION_EXPIRED",
        `Reservation ${reservation.id} expired; released ${reservation.quantity} unit(s).`
      );
    }
  }

  reserve(
    productId: string,
    quantity: number,
    now = Date.now(),
    ttlMs = 30_000
  ): Reservation {
    this.expireReservations(now);

    const product = this.products.get(productId);

    if (!product) {
      this.record("RESERVE_FAILED", `Unknown product: ${productId}`);
      throw new Error("Product not found.");
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.record("RESERVE_FAILED", "Invalid reservation quantity.");
      throw new Error("Quantity must be a positive integer.");
    }

    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new Error("Reservation TTL must be positive.");
    }

    if (product.availableStock < quantity) {
      this.record(
        "RESERVE_FAILED",
        `Insufficient stock for ${product.name}.`
      );
      throw new Error("Not enough stock available.");
    }

    // This synchronous state transition prevents two callers from
    // reserving the same units within this JavaScript runtime.
    product.availableStock -= quantity;
    product.reservedStock += quantity;

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      productId,
      quantity,
      status: "reserved",
      createdAt: now,
      expiresAt: now + ttlMs,
    };

    this.reservations.set(reservation.id, reservation);

    this.record(
      "RESERVATION_CREATED",
      `Reserved ${quantity} unit(s) of ${product.name}.`
    );

    return { ...reservation };
  }

  checkout(reservationId: string, now = Date.now()): Reservation {
    this.expireReservations(now);

    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      this.record(
        "CHECKOUT_FAILED",
        `Unknown reservation: ${reservationId}`
      );
      throw new Error("Reservation not found.");
    }

    if (reservation.status !== "reserved") {
      this.record(
        "CHECKOUT_FAILED",
        `Reservation ${reservationId} is ${reservation.status}.`
      );
      throw new Error("Reservation is no longer active.");
    }

    const product = this.products.get(reservation.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    product.reservedStock -= reservation.quantity;
    product.soldStock += reservation.quantity;
    reservation.status = "checked_out";

    this.record(
      "CHECKOUT_SUCCESS",
      `Checkout completed for reservation ${reservationId}.`
    );

    return { ...reservation };
  }

  cancel(reservationId: string, now = Date.now()): Reservation {
    this.expireReservations(now);

    const reservation = this.reservations.get(reservationId);

    if (!reservation) {
      throw new Error("Reservation not found.");
    }

    if (reservation.status !== "reserved") {
      throw new Error("Reservation is no longer active.");
    }

    const product = this.products.get(reservation.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    product.reservedStock -= reservation.quantity;
    product.availableStock += reservation.quantity;
    reservation.status = "cancelled";

    this.record(
      "RESERVATION_CANCELLED",
      `Reservation ${reservationId} was cancelled.`
    );

    return { ...reservation };
  }

  refresh(now = Date.now()): void {
    this.expireReservations(now);
  }
}
