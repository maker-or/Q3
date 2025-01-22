"use client";

import { UploadDropzone } from "~/utils/uploadthing";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

// Define an interface for the uploaded file data
interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export default function HomePage() {
  const { userId } = useAuth(); // Ensure userId is extracted correctly
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    branch: '',
    tags: ''
  });
  // Use the UploadedFile interface for the uploadedFiles state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadComplete = (response: UploadedFile[]) => {
    // Store uploaded files in state
    setUploadedFiles(response);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const uploadPromises = uploadedFiles.map(fileData =>
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
      // Reset form and uploaded files after successful upload
      setFormData({
        year: '', branch: '', tags: '',
        name: ""
      });
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error updating database:', error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#262627] to-[#434344] text-black">
      <form onSubmit={handleSubmit} className="flex-col gap-5 m-2">
        <input type="text" placeholder="Filename" className="p-3 rounded-md" />
        <div className="flex gap-2 my-2">
          <select 
            name="year" 
            value={formData.year}
            onChange={handleInputChange}
            className="p-3 rounded-md"
          >
            <option value="" disabled>Select Year</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
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
            onClientUploadComplete={handleUploadComplete} // Store files on upload
            className="h-500px w-500px rounded border-2 border-dashed border-[#f7eee3]/30 py-2 text-[#f7eee3] hover:border-[#f7eee3] m-4 p-4"
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
