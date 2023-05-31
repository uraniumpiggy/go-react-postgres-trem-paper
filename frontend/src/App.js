import './App.css';
import LogIn from './components/LogIn/LogIn';
import Register from './components/Register/Register';
import ChatsList from './components/ChatsList/ChatsList';
import { Route, Routes } from 'react-router-dom';
import Chat from './components/Chat/Chat';

function App() {
  return (
    <div className="App h-100">
      <Routes>
        <Route path="/login" element={<LogIn/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
        <Route path="/" element={<ChatsList/>}></Route>
        <Route path="/chats/:id" element={<Chat/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
