// components/ProfilePictureUploader.tsx
import React from 'react';
import { useUser } from '@/hooks/useUser';
import { uploadFile } from '@/lib/uploadFile';

export default function ProfilePictureUploader() {
  const { user } = useUser();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) {
      alert('Debes iniciar sesión para subir archivos');
      return;
    }

    try {
      await uploadFile(file, user.id);
      alert('Archivo subido correctamente');
    } catch (err: any) {
      alert('Error al subir archivo: ' + err.message);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload" className="cursor-pointer text-blue-600 underline">
        Selecciona un archivo para subir
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}




