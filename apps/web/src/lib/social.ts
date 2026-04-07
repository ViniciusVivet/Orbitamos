export const instagramUrl = "https://www.instagram.com/orbitamosbr/";
export const youtubeChannelUrl = "https://www.youtube.com/@VivetTv";
export const youtubeFeaturedEmbed = "https://www.youtube.com/embed/b7re8uY8Pf4?start=8";
export const discordUrl = "https://discord.gg/SEU-GRUPO";
export const whatsappMentoriaUrl =
  "https://wa.me/5511949138973?text=Quero%20falar%20sobre%20as%20mentorias%20da%20Orbitamos";

export const whatsappProjetosUrl =
  "https://wa.me/5511949138973?text=Quero%20solicitar%20um%20or%C3%A7amento%20ou%20um%20projeto%20como%20os%20da%20Orbitamos";

const WA_BUSINESS = "5511949138973";

function waWithText(text: string) {
  return `https://wa.me/${WA_BUSINESS}?text=${encodeURIComponent(text)}`;
}

/** Mensagens do botão flutuante por página */
export const whatsappFloatByPage = {
  home: waWithText(
    "Olá, vim pelo início do site da Orbitamos e quero falar no WhatsApp."
  ),
  projetos: waWithText(
    "Olá, vim pela página de projetos da Orbitamos e quero falar no WhatsApp."
  ),
  contato: waWithText(
    "Olá, vim pela página de contato da Orbitamos e quero falar no WhatsApp."
  ),
} as const;

export type WhatsappFloatPage = keyof typeof whatsappFloatByPage;
