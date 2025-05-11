import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditUpdate() {
  const { id } = useParams();
  const [caption, setCaption] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:9090/api/progress-updates/${id}`)
      .then((res) => setCaption(res.data.caption));
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:9090/api/progress-updates/${id}`, { caption });
    navigate(`/update/${id}`);
  };

  return (
    <form onSubmit={handleUpdate} className='p-4'>
      <h2 className='text-xl font-semibold mb-4'>Edit Update</h2>
      <input type='text' value={caption} onChange={(e) => setCaption(e.target.value)} className='border p-2 w-full mb-4' required />
      <button type='submit' className='bg-yellow-500 text-white px-4 py-2 rounded'>Update</button>
    </form>
  );
}
