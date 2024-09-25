import { ChangeEvent, useState } from 'react';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';

export const ShareFileButton = ({
  user,
  sendRequest,
  connected,
}: {
  user: User;
  sendRequest: (user: User, file: File) => void;
  connected: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files) {
      const file: File | null = e.target.files[0];

      if (file) {
        console.log('File selected:', file);

        toast.info(`"${file.name}" has been selected!`, { duration: 2000 });
        sendRequest(user, file);
      }
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button
        onClick={() => document.getElementById('file-input')!.click()}
        className={`w-full transition-all duration-300 ease-in-out ${
          isHovered ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={user.status !== 'available' || connected}
      >
        <Share2 size={16} className="mr-2" />
        Share File
      </Button>
    </div>
  );
};
