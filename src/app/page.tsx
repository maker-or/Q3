"use client";

import Link from "next/link";
import { UploadDropzone } from "~/utils/uploadthing";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";


export default function HomePage() {
  const userId = useAuth();
  const [formData, setFormData] = useState({
    year: '',
    branch: '',
    tags: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadComplete = async (response: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>) => {
    try {
      const uploadPromises = response.map(fileData =>
        fetch('/api/uploadfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...fileData,
            userId: userId,
            ...formData // Include the form data
          }),
        })
      );

      await Promise.all(uploadPromises);
      // Reset form after successful upload
      setFormData({ year: '', branch: '', tags: '' });
    } catch (error) {
      console.error('Error updating database:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#262627] to-[#434344] text-black">
      <form onSubmit={(e) => e.preventDefault()} className="flex-col gap-5 m-2">
        <input type="text" placeholder="Filename" className="p-3 rounded-md" />
        <div className="flex gap-2 my-2">
          <input 
            type="text" 
            name="year" 
            value={formData.year}
            onChange={handleInputChange}
            placeholder="year" 
            className="p-3 rounded-md"
          />
          <input 
            type="text" 
            name="branch" 
            value={formData.branch}
            onChange={handleInputChange}
            placeholder="Branch" 
            className="p-3 rounded-md"
          />
        </div>
        <input 
          type="text" 
          name="tags" 
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="Tag" 
          className="p-3 rounded-md" 
        />

        <div className="bg-red-600 h-500px w-500px">
          <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res) {
                void handleUploadComplete(res);
              }
            }}
            className="h-500px w-500px rounded border-2 border-dashed border-[#f7eee3]/30 py-2 text-[#f7eee3] hover:border-[#f7eee3]"
          />
        </div>

        <button 
          type="submit" 
          className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Submit Form
        </button>
      </form>
    </main>
  );
}
