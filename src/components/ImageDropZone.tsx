import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  file?: File;
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

const ImageDropZone = ({ file, setFile }: Props) => {
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      console.log("file", file);
    },
  });

  return (
    <>
      {!file ? (
        <section
          className="container"
          style={{
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.5)",
            minHeight: 128,
          }}
        >
          <div
            {...getRootProps({ className: "dropzone" })}
            style={{ padding: 16 }}
          >
            <input {...getInputProps()} />
            <h1>Drag and drop the image you want to upload for your post.</h1>
          </div>
        </section>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={URL.createObjectURL(file)} alt="postimage" />
      )}
    </>
  );
};

export default ImageDropZone;
