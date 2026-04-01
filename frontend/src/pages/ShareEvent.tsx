import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowRight, Share2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import { Button } from '../components/ui/button';

export default function ShareEvent() {
  const { shareToken } = useParams();
  const [copied, setCopied] = useState(false);

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
    <PageLayout center className="justify-center p-6">
      <div className="w-full max-w-md space-y-8 text-center animate-in fade-in slide-in-from-bottom-4">

        <div className="space-y-3">
          <div className="w-16 h-16 bg-primaryLight/30 rounded-full flex items-center justify-center mx-auto text-primary">
            <Share2 size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-heading font-extrabold tracking-tight">¡Parrilla lista!</h1>
          <p className="text-onSurfaceVariant text-sm">Compartí este link o el código QR con tus amigos para que empiecen a sumarse.</p>
        </div>

        <Card variant="surface" className="p-8 space-y-8 flex flex-col items-center">
          <div className="bg-white p-4 rounded-xl border border-outlineVariant/50 shadow-sm">
            <QRCodeSVG
              value={shareUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#1f1a17"
              level="M"
            />
          </div>

          <div className="w-full space-y-2">
            <SectionLabel className="items-start flex">Link directo</SectionLabel>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 bg-surfaceHighest border-transparent rounded-xl p-3 text-onSurfaceVariant focus:outline-none text-xs truncate"
              />
              <Button
                variant={copied ? 'ghost' : 'cta'}
                size="icon"
                onClick={handleCopy}
                className={copied ? 'bg-success text-white rounded-xl w-12' : 'rounded-xl w-12'}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </Button>
            </div>
          </div>
        </Card>

        <Link
          to={`/e/${shareToken}/join`}
          className="w-full py-5 bg-surfaceLow text-primary border border-outlineVariant/50 rounded-card text-sm font-heading font-bold transition-transform active:scale-[0.98] flex items-center justify-center gap-2 hover:bg-primaryLight/20"
        >
          Ya compartí, quiero ingresar mi gasto <ArrowRight size={18} />
        </Link>
      </div>
    </PageLayout>
  );
}
