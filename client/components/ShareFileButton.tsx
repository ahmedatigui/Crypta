import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ShareFileButton = ({ user, roomName, sendRequest }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    // You can then share the file via WebRTC, sockets, or other methods
    console.log('File selected:', file);
    //console.log({ roomName: roomName , sender: socket.id, receiver: user.id, message: "Wut up" })
    sendRequest(user, file);
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
        onClick={() => document.getElementById('file-input').click()}
        className={`w-full transition-all duration-300 ease-in-out ${isHovered ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={user.status !== 'available'}
      >
        Share File
      </Button>

      {selectedFile && (
        <div className="text-gray-700">
          Selected File: <strong>{selectedFile.name}</strong>
        </div>
      )}
    </div>
  );
};

