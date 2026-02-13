import { useEffect, useRef } from "react";

const TelegramLogin = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Define the global callback function so the script can find it
    window.onTelegramAuth = (user) => {
      alert(`Logged in as ${user.first_name} (${user.id})`);
      console.log(user);
    };

    // Create the script element
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;

    // Set the data attributes
    script.setAttribute("data-telegram-login", "first_test_bot");
    script.setAttribute("data-size", "medium");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");

    // Append it to the container div
    containerRef.current.appendChild(script);

    // Cleanup function to remove the script if the component unmounts
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      delete window.onTelegramAuth;
    };
  }, []);

  return <div ref={containerRef}></div>;
};

export default TelegramLogin;
