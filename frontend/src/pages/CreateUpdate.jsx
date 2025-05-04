import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateUpdate() {
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('caption', caption);
    if (media) formData.append('media', media);
    await axios.post('http://localhost:9090/api/progress-updates', formData);
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className='p-4'>
      <h2 className='text-xl font-semibold mb-4'>Create Update</h2>
      <input type='text' value={caption} onChange={(e) => setCaption(e.target.value)} placeholder='Caption' className='border p-2 w-full mb-2' required />
      <input type='file' onChange={(e) => setMedia(e.target.files[0])} className='mb-4' />
      <button type='submit' className='bg-green-500 text-white px-4 py-2 rounded'>Submit</button>
    </form>
  );
}
