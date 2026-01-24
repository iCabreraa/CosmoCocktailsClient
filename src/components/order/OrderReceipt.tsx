"use client";

type Item = {
  cocktail_name?: string;
  size_name?: string;
  quantity: number;
  item_total: number;
};

type Props = {
  order: {
    id: string;
    order_ref?: string | null;
    total_amount: number;
    order_date?: string;
  };
  items: Item[];
};

export default function OrderReceipt({ order, items }: Props) {
  const print = () => window.print();
  return (
    <>
      <button
        onClick={print}
        className="text-cosmic-silver hover:text-cosmic-gold underline-offset-4 hover:underline text-sm"
      >
        Descargar recibo
      </button>
      {/* Plantilla básica de recibo imprimible */}
      <div className="receipt no-print" aria-hidden>
        <h1>CosmoCocktails — Recibo</h1>
        <div className="muted">Pedido {order.order_ref || `#${order.id}`}</div>
        <div className="muted">
          Fecha: {order.order_date ?? new Date().toLocaleString()}
        </div>
        <div style={{ height: 8 }} />
        {items.map((it, i) => (
          <div className="row" key={i}>
            <div>
              {(it.cocktail_name || "Cóctel") +
                (it.size_name ? ` · ${it.size_name}` : "")}
              <div className="muted">Cantidad: {it.quantity}</div>
            </div>
            <div>€{Number(it.item_total).toFixed(2)}</div>
          </div>
        ))}
        <div className="row">
          <strong>Total</strong>
          <strong>€{Number(order.total_amount).toFixed(2)}</strong>
        </div>
      </div>
    </>
  );
}
