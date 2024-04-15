import {Link} from 'react-router-dom'
export default function NotFound(){
  return (
    <div className="App color4-back">
      <div className="top-bar color6-back">
        <div className='home-head color1-back'>
        </div>
        <div className='bottom-buttons'>
        </div>
      </div>
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