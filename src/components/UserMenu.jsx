import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../context/AuthContext";

const UserMenu = ({ onResetConfig }) => {
  const { user, signOut } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleResetConfig = () => {
    if (
      window.confirm(
        "Are you sure you want to reset your configuration? You will need to re-enter your AWS settings."
      )
    ) {
      onResetConfig();
    }
    setIsOpen(false);
  };

  const getUserEmail = () => {
    if (user && user.attributes && user.attributes.email) {
      return user.attributes.email;
    }
    return "";
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="user-menu-button" onClick={() => setIsOpen(!isOpen)}>
        <i className="fas fa-user-circle"></i>
        <div className="user-email">{getUserEmail()}</div>
      </div>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-item" onClick={handleResetConfig}>
            <i className="fas fa-cog"></i>
            Reset Configuration
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-item danger" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            Sign Out
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
