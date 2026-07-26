import React, { createContext, useState, useContext } from "react";

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);
  // Display title for the chat drawer header. Passed in by whoever opens
  // the chat (project card / ticket row) so the drawer doesn't have to
  // guess or hardcode it. Backend can swap this for a live lookup by id.
  const [activeTicketTitle, setActiveTicketTitle] = useState(null);

  // File upload modal state (regular attachment vs. final deliverable)
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isFinalFileModalOpen, setIsFinalFileModalOpen] = useState(false);

  const openChat = (ticketId, ticketTitle = null) => {
    setActiveTicketId(ticketId);
    setActiveTicketTitle(ticketTitle);
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveTicketId(null);
    setActiveTicketTitle(null);
  };

  return (
    <TicketContext.Provider
      value={{
        isOpen,
        activeTicketId,
        activeTicketTitle,
        openChat,
        closeChat,
        isFileModalOpen,
        setIsFileModalOpen,
        isFinalFileModalOpen,
        setIsFinalFileModalOpen,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTicket = () => useContext(TicketContext);
