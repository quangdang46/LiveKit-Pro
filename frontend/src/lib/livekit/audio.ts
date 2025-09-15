export function removeAudioElement(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  try {
    audio.pause();
    audio.srcObject = null as unknown as MediaStream | null;
    audio.removeAttribute("src");
    audio.load();
  } catch (e) {
    console.log("Error pause audio:", e);
  }
}

export async function playAudio(
  url: string,
  setIsPlaying: (playing: boolean) => void
): Promise<void> {
  try {
    setIsPlaying(true);
    const audio = new Audio(url);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    await audio.play();
  } catch {
    setIsPlaying(false);
  }
}
