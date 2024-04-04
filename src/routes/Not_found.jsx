import {Link} from 'react-router-dom'
export default function NotFound(){
  return (
    <div>
      <h1>
        You seem to be lost...
      </h1>
      <p>
        Here are some useful links:
      </p>
      <Link to='/'>Home</Link>
    </div>
  )
}