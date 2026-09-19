// Utilitário de Áudio Sintetizado para Alerta de Chamado de Corrida
// Utiliza a Web Audio API nativa para não depender de arquivos externos e garantir funcionamento offline/instantâneo

class AudioAlertService {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private isPlaying = false;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('Web Audio API não disponível:', e);
      return null;
    }
  }

  // Toca um bipe duplo suave e característico de chamada de corrida (estilo app de entrega)
  public playChime() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primeiro tom (784 Hz - Sol)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, now);
      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Segundo tom (1046.5 Hz - Dó agudo, gerando o "Ding-Dong" alegre de corrida)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1046.5, now + 0.15);
      gain2.gain.setValueAtTime(0.01, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.45, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('Erro ao reproduzir alerta sonoro:', e);
    }

    // Vibração háptica no celular se suportado
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch (e) {}
    }
  }

  // Inicia o alarme contínuo em loop (toca a cada 2.4 segundos até ser desligado)
  public startCourierAlarm() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Toca imediatamente o primeiro chime
    this.playChime();

    // Repete a cada 2.4 segundos
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playChime();
      }
    }, 2400);
  }

  // Para o alarme imediatamente (quando o entregador aceita ou recusa a corrida)
  public stopCourierAlarm() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }

  public isAlarmPlaying(): boolean {
    return this.isPlaying;
  }
}

export const audioAlert = new AudioAlertService();
