import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/trocas-e-devolucoes")({
  component: ReturnsPolicy,
  head: () => ({
    meta: [
      { title: `Trocas e devoluções — ${site.name}` },
      { name: "description", content: "Como funcionam as trocas, devoluções e reembolsos das compras feitas no site." },
    ],
  }),
});

function ReturnsPolicy() {
  return (
    <PolicyPage
      title="Trocas e devoluções"
      intro="Queremos que você fique feliz com a sua compra. Se algo não sair como esperado, a gente resolve."
      updated="24 de novembro de 2026"
    >
      <PolicySection title="Desistência da compra (até 7 dias)">
        <p>
          Pelo Código de Defesa do Consumidor, em compras feitas pela internet você pode desistir em até{" "}
          <strong>7 dias corridos</strong> depois de receber o pedido, sem precisar explicar o motivo.
        </p>
        <ul>
          <li>O produto precisa estar sem uso, de preferência na embalagem original.</li>
          <li>
            Devolvemos o <strong>valor total pago, incluindo o frete</strong>, pela mesma forma de pagamento: estorno no cartão ou
            devolução do Pix.
          </li>
          <li>O envio de volta fica por nossa conta. Fale com a gente que combinamos a melhor forma.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Produto com defeito ou danificado na entrega">
        <p>
          Se o produto chegar quebrado, vazando ou com algum defeito, avise em até <strong>30 dias</strong> depois de receber,
          com fotos do produto e da embalagem.
        </p>
        <ul>
          <li>Você escolhe: trocar por outro igual, trocar por outro produto ou receber o dinheiro de volta.</li>
          <li>Todos os custos da troca ficam por nossa conta.</li>
          <li>Se a caixa chegar amassada ou molhada, tire uma foto antes de abrir. Isso ajuda a resolver mais rápido.</li>
        </ul>
      </PolicySection>

      <PolicySection title="O que não é defeito">
        <p>
          Nossos produtos são feitos à mão, um a um. Pequenas diferenças de cor, textura, formato e intensidade do aroma entre
          uma peça e outra são naturais da produção artesanal e não são consideradas defeito.
        </p>
      </PolicySection>

      <PolicySection title="Como pedir uma troca ou devolução">
        <ul>
          <li>Mande uma mensagem pelo WhatsApp ou e-mail com o <strong>número do pedido</strong> (está na página do pedido).</li>
          <li>Conte o que aconteceu e, se for o caso, envie fotos.</li>
          <li>Respondemos com as instruções e o prazo para resolver.</li>
        </ul>
        <p>
          O reembolso no cartão aparece na fatura conforme o prazo da operadora, que pode levar até duas faturas. A devolução do
          Pix é feita na conta de origem.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
