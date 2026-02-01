# Chat Feature Integration Checklist

## 1. DEPENDENCIES
- [ ] Required packages installed (zustand/context, date-fns, etc)
- [ ] No conflicting versions
- [ ] package-lock.json updated

## 2. FILES CREATED
- [ ] Types: /types/chat.ts
- [ ] API Service: /services/chatService.ts
- [ ] WebSocket Manager: /services/websocketManager.ts
- [ ] State Management: /stores/useChatStore.ts (atau Context/Redux)
- [ ] Custom Hooks: /hooks/useChat.ts
- [ ] Components:
  - [ ] ConversationList.tsx
  - [ ] MessageList.tsx
  - [ ] MessageInput.tsx
  - [ ] ChatWindow.tsx
  - [ ] ChatContainer.tsx

## 3. CONFIGURATION
- [ ] Environment variables set (.env.local)
- [ ] API Base URL configured
- [ ] WebSocket URL configured

## 4. CODE INTEGRATION
- [ ] Auth token access implemented in chatService.ts
- [ ] getAuthToken() function works correctly
- [ ] Role checking for perawat implemented
- [ ] Import paths all correct

## 5. FUNCTIONALITY TESTING
- [ ] Fetch conversations works
- [ ] Display conversation list works
- [ ] Select conversation works
- [ ] Fetch messages works
- [ ] Display messages works
- [ ] Send message works
- [ ] WebSocket connection established
- [ ] Real-time message receive works
- [ ] Mark as read works
- [ ] Unread count updates correctly
- [ ] Error handling works
- [ ] Loading states display correctly

## 6. WEBSOCKET TESTING
- [ ] Connection successful
- [ ] Heartbeat ping/pong working
- [ ] Reconnection on disconnect works
- [ ] Connection cleanup on unmount works
- [ ] No memory leaks

## 7. UI INTEGRATION
- [ ] Components render without errors
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive behavior (if applicable)

## 8. EDGE CASES
- [ ] Empty conversation list handled
- [ ] Empty message list handled
- [ ] Network errors handled gracefully
- [ ] Token expiry handled
- [ ] Unauthorized access prevented (non-perawat roles)

## 9. PERFORMANCE
- [ ] No unnecessary re-renders
- [ ] WebSocket doesn't reconnect infinitely
- [ ] Messages don't duplicate

## 10. SECURITY
- [ ] JWT token not exposed in console/network tab
- [ ] Only perawat can access chat
- [ ] User can only see their own conversations
