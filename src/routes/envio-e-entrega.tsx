import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/envio-e-entrega")({
  component: ShippingPolicy,
  head: () => ({
    meta: [
      { title: `Envio e entrega — ${site.name}` },
      { name: "description", content: "Prazos de produção, retirada na feira e envio por transportadora." },
    ],
  }),
});

function ShippingPolicy() {
  const days = site.shipping.handlingDays;
  return (
    <PolicyPage
      title="Envio e entrega"
      intro="Cada pedido é preparado à mão. Veja os prazos e as formas de receber."
      updated="24 de novembro de 2026"
    >
      <PolicySection title="Prazo de produção">
        <p>
          Depois que o pagamento é confirmado, preparamos o seu pedido em até <strong>{days} dias úteis</strong>. Pagamentos por
          Pix são confirmados na hora; por cartão, normalmente também.
        </p>
      </PolicySection>

      <PolicySection title="Retirada na feira (grátis)">
        <ul>
          <li>{site.checkout.pickup}.</li>
          <li>Avisamos pelo WhatsApp quando o pedido estiver pronto.</li>
          <li>Na retirada, informe o seu nome ou o número do pedido.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Envio por transportadora">
        <ul>
          <li>Enviamos para todo o Brasil. O valor e o prazo aparecem no carrinho e no checkout, calculados pelo seu CEP.</li>
          <li>O prazo mostrado já soma o tempo de produção ao prazo da transportadora.</li>
          <li>Quando o pedido for postado, mandamos o código de rastreio pelo WhatsApp ou e-mail.</li>
          <li>Os prazos são das transportadoras e podem variar em feriados, greves ou regiões mais distantes.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Home sprays e difusores">
        <p>
          Produtos com álcool só podem viajar com transportadoras que aceitam esse tipo de item. Por isso, para alguns CEPs pode
          não aparecer opção de envio. Nesses casos, escolha a retirada na feira ou fale com a gente pelo WhatsApp que buscamos
          outra solução.
        </p>
      </PolicySection>

      <PolicySection title="Endereço de entrega">
        <ul>
          <li>Confira o endereço, o número e o complemento antes de finalizar.</li>
          <li>
            Se a encomenda voltar por endereço incorreto ou por ninguém receber após as tentativas da transportadora, o novo
            envio terá um novo frete.
          </li>
          <li>Em caso de atraso, extravio ou avaria no transporte, nós acompanhamos com a transportadora até resolver.</li>
        </ul>
      </PolicySection>
    </PolicyPage>
  );
}
