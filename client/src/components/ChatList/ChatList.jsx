import { Link, useLocation } from "react-router-dom"; // 1. Import useLocation
import "./chatList.css";
import { useQuery } from "@tanstack/react-query";

const ChatList = () => {
  const location = useLocation(); // 2. Get the current URL

  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/userchats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard">Create a new Chat</Link>
      <Link to="/">Explore AI Chat App</Link>
      <Link to="/contact">Contact</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending
          ? "Loading..."
          : error
          ? "Something went wrong!"
          : data?.map((chat) => (
              <Link
                to={`/dashboard/chats/${chat._id}`}
                key={chat._id}
                // 3. Add 'active' class if the URL matches this chat's ID
                className={location.pathname.includes(chat._id) ? "active" : ""}
              >
                {chat.title}
              </Link>
            ))}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <span>Upgrade to AI Pro</span>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
