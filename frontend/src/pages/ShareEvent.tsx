import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowRight, Share2, Sun } from 'lucide-react';

export default function ShareEvent() {
  const { shareToken } = useParams();
  const [copied, setCopied] = useState(false);

  // Use the network/host IP or generic localhost based on window
  const shareUrl = `${window.location.origin}/e/${shareToken}/join`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-body text-onSurface">
      <div className="w-full max-w-md space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">
        
        <div className="space-y-3">
          <div className="w-16 h-16 bg-primaryLight/30 rounded-full flex items-center justify-center mx-auto text-primary">
            <Share2 size={28} strokeWidth={2.5}/>
          </div>
          <h1 className="text-3xl font-heading font-medium tracking-tight">¡Parrilla lista!</h1>
          <p className="text-onSurfaceVariant text-sm">Compartí este link o el código QR con tus amigos para que empiecen a sumarse.</p>
        </div>

        <div className="bg-surfaceLow border border-outlineVariantGhost rounded-[1.25rem] p-8 space-y-8 flex flex-col items-center shadow-[0_4px_30px_rgba(45,51,53,0.02)]">
          <div className="bg-white p-4 rounded-xl border border-outlineVariantGhost shadow-sm relative">
            <Sun className="absolute w-8 h-8 text-secondary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <QRCodeSVG 
                value={shareUrl} 
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#2b6586"}
                level={"M"}
            />
          </div>

          <div className="w-full space-y-2">
            <label className="text-[10px] items-start flex font-bold tracking-widest uppercase text-secondary">Link directo</label>
            <div className="flex gap-2">
                <input 
                    readOnly 
                    value={shareUrl} 
                    className="flex-1 bg-surfaceHighest border-transparent rounded-xl p-3 text-onSurfaceVariant focus:outline-none text-xs truncate"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-4 rounded-xl flex items-center justify-center font-bold transition-all ${copied ? 'bg-success text-white' : 'bg-primary text-white hover:bg-primaryDim'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
            </div>
          </div>
        </div>

        <Link 
          to={`/e/${shareToken}/join`}
          className="w-full py-5 bg-surfaceLow text-primary border border-outlineVariantGhost rounded-xl text-sm font-heading font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-primaryLight/20">
          Ya compartí, quiero ingresar mi gasto <ArrowRight size={18}/>
        </Link>
      </div>
    </div>
  );
}
