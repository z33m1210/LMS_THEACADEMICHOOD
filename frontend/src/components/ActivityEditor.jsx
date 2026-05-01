import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';

const ActivityEditor = ({ initialValue, onChange }) => {
  const editorRef = useRef(null);

  const handleImageUpload = (blobInfo, progress, failure) => {
    return new Promise(async (resolve, reject) => {
      const formData = new FormData();
      formData.append('image', blobInfo.blob(), blobInfo.filename());

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:5000/api/assets/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        resolve(res.data.url);
      } catch (err) {
        reject('Upload failed: ' + err.message);
      }
    });
  };

  return (
    <div className="activity-editor-container glass-card">
      <Editor
        apiKey='y6jl2hx8gkwtes0gliwqmnkrw5ycpoarr581lqiy25oikjsu'
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={initialValue}
        onEditorChange={(content) => onChange(content)}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | image | help',
          content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:16px; background:white; }',
          images_upload_handler: handleImageUpload,
          skin: 'oxide',
          content_css: 'default',
          promotion: false,
          branding: false,
          license_key: 'gpl'
        }}
      />
    </div>
  );
};

export default ActivityEditor;
