import { createFileRoute } from "@tanstack/react-router";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";
import { site } from "@/config/site";

export const Route = createFileRoute("/privacidade")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [
      { title: `Privacidade — ${site.name}` },
      { name: "description", content: "Quais dados coletamos, para que usamos e como você pode pedir acesso ou exclusão." },
    ],
  }),
});

function PrivacyPolicy() {
  return (
    <PolicyPage
      title="Privacidade"
      intro="Usamos os seus dados só para entregar o seu pedido e falar com você sobre ele. Nunca vendemos dados."
      updated="24 de novembro de 2026"
    >
      <PolicySection title="Quais dados coletamos">
        <ul>
          <li><strong>Para o pedido:</strong> nome, e-mail, WhatsApp e os produtos comprados.</li>
          <li><strong>Para a entrega:</strong> CEP e endereço, quando você escolhe envio.</li>
          <li><strong>Avaliações:</strong> o nome e o comentário que você escrever, se decidir avaliar um produto.</li>
        </ul>
        <p>
          Os dados do cartão são digitados direto no formulário seguro do <strong>Mercado Pago</strong>. Eles não passam pelos
          nossos servidores e não ficam guardados com a gente.
        </p>
      </PolicySection>

      <PolicySection title="Para que usamos">
        <ul>
          <li>Processar o pagamento e preparar o pedido.</li>
          <li>Calcular o frete e enviar a encomenda.</li>
          <li>Falar com você sobre o pedido, trocas e entregas.</li>
          <li>Mostrar a sua avaliação na página do produto, se você avaliar.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Com quem compartilhamos">
        <p>Só com os serviços necessários para a loja funcionar:</p>
        <ul>
          <li><strong>Mercado Pago:</strong> processa os pagamentos.</li>
          <li><strong>Melhor Envio e a transportadora escolhida:</strong> recebem nome e endereço para a entrega.</li>
          <li><strong>Supabase:</strong> guarda os pedidos com segurança (banco de dados).</li>
          <li><strong>Cloudflare:</strong> hospeda o site.</li>
        </ul>
      </PolicySection>

      <PolicySection title="O que fica no seu navegador">
        <p>
          O carrinho, o CEP digitado e a preferência de tema claro ou escuro ficam salvos só no seu navegador, para você não
          perder nada ao voltar. Não usamos cookies de propaganda.
        </p>
      </PolicySection>

      <PolicySection title="Por quanto tempo guardamos">
        <p>
          Guardamos os dados dos pedidos pelo tempo necessário para atender você, resolver trocas e cumprir obrigações legais.
        </p>
      </PolicySection>

      <PolicySection title="Seus direitos">
        <p>
          Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou apagar os seus dados a qualquer
          momento. Basta mandar um e-mail para <strong>{site.contact.email}</strong>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
