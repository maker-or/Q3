"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

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
    name: "",
    year: "",
    branch: "",
    tags: "",
  });
  // Use the UploadedFile interface for the uploadedFiles state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [file, setFile] = useState<undefined | File>(undefined);
  useEffect(() => console.log(file), [file]);

  const handleUploadComplete = (response: UploadedFile[]) => {
    // Store uploaded files in state
    setUploadedFiles(response);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const uploadPromises = uploadedFiles.map((fileData) =>
      //   fetch("/api/uploadfile", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       ...fileData,
      //       userId: userId,
      //       ...formData, // Include the form data
      //     }),
      //   }),
      // );

      const data = new FormData();
      data.append("year", formData.year);
      data.append("branch", formData.branch);
      data.append("tags", formData.tags);
      data.append("name", formData.name);
      data.append("file", file || "");

      fetch("/api/uploadfile", {
        method: "POST",
        body: data,
      }),
        // await Promise.all(uploadPromises);
        // Reset form and uploaded files after successful upload
        setFormData({
          year: "",
          branch: "",
          tags: "",
          name: "",
        });
      setUploadedFiles([]);
    } catch (error) {
      console.error("Error updating database:", error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#262627] to-[#434344] text-black">
      <form onSubmit={handleSubmit} className="m-2 flex-col gap-5">
        <input type="text" placeholder="Filename" className="rounded-md p-3" />
        <div className="my-2 flex gap-2">
          <select
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className="rounded-md p-3"
          >
            <option value="" disabled>
              Select Year
            </option>
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
            className="rounded-md p-3"
          />
        </div>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          placeholder="Tag"
          className="rounded-md p-3"
        />

        <div className="h-500px w-500px bg-red-600">
          {/* <UploadDropzone
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete} // Store files on upload
            className="h-500px w-500px m-4 rounded border-2 border-dashed border-[#f7eee3]/30 p-4 py-2 text-[#f7eee3] hover:border-[#f7eee3]"
          /> */}
          <input
            type="file"
            name=""
            id=""
            onChange={(e) => setFile(e.target.files?.[0] || undefined)}
          />
        </div>

        <button
          type="submit"
          className="mt-4 w-full rounded-md bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700"
        >
          Submit Form
        </button>
      </form>
    </main>
  );
}
