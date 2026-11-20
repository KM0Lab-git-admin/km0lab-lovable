export type ShareChannelId = "whatsapp" | "email" | "facebook";

interface OpenShareChannelOptions {
  channel: ShareChannelId;
  message: string;
  subject: string;
  link: string;
}

/** Browser implementation; production can replace it without editing callers. */
export async function openShareChannel({ channel, message, subject, link }: OpenShareChannelOptions): Promise<void> {
  if (channel === "email") {
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    return;
  }
  const url = channel === "whatsapp"
    ? `https://wa.me/?text=${encodeURIComponent(message)}`
    : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}