module.exports = (function() {
  return new function() {
    var self      = this,
        messages  = [];

    this.getMessages = function() {
      return messages;
    };

    this.getMessage = function(messageId) {
      return messages[messageId];
    };

    this.addMessage = function(message) {
      return messages.push(message) - 1;
    };

    this.removeMessage = function(messageId) {
      delete messages[messageId];
    };

    this.messagesCount = function() {
      return Object.keys(messages).length;
    };
  };
})();