import { TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface ContributionPopupProps {
  memberName: string;
  amount: number;
  chamaName: string;
  isVisible: boolean;
}

export const ContributionPopup: React.FC<ContributionPopupProps> = ({
  memberName,
  amount,
  chamaName,
  isVisible
}) => {
  const [show, setShow] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setPulse(true);
      const pulseInterval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);

      return () => clearInterval(pulseInterval);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 max-w-sm animate-in slide-in-from-top-5 fade-in duration-300"
    >
      <Card className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-primary/20 shadow-2xl overflow-hidden">
        <div className="relative p-6">
          {/* Sparkle effect */}
          <div className={`absolute top-2 right-2 text-yellow-500 transition-transform duration-1000 ${pulse ? 'scale-110 rotate-180' : 'scale-100 rotate-0'}`}>
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="flex items-start gap-4">
            <div 
              className={`p-3 rounded-full bg-primary/20 transition-transform duration-1000 ${pulse ? 'scale-110' : 'scale-100'}`}
            >
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                🎉 New Contribution!
              </h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{memberName}</span> contributed{' '}
                <span className="font-bold text-primary text-lg">
                  KES {amount.toLocaleString()}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                to <span className="font-medium">{chamaName}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-progress"
              style={{ 
                animation: 'progress 5s linear forwards',
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
