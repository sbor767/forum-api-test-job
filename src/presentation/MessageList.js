import React from 'react'

import MessageItem from './MessageItem'

export default function MessageList({ headers, editItemId, onEditItem, onDeleteItem }) {
  return (
    <div
      id="message-container"
      ref={element => {
        this.headerContainer = element
      }}
    >
      {headers.map(current => (
        <MessageItem
          key={`item_id-${current.id}`}
          header={current.header}
          messageId={current.id}
          onEditState={current.id === editItemId}
          onEdit={onEditItem}
          onDelete={onDeleteItem}
        />
      ))}
    </div>
  )
}