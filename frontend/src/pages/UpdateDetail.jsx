import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function UpdateDetail() {
  const { id } = useParams();
  const [update, setUpdate] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:9090/api/progress-updates/${id}`)
      .then((res) => setUpdate(res.data));
  }, [id]);

  if (!update) return <p className='p-4'>Loading...</p>;

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold'>{update.caption}</h2>
      {update.mediaUrl && <img src={update.mediaUrl} alt='media' className='w-64 my-2' />}
      <Link to={`/edit/${id}`} className='bg-yellow-500 text-white px-4 py-2 mr-2 rounded'>Edit</Link>
    </div>
  );
}
