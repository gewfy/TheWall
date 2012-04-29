module.exports = (function() {
  return new function() {
    var self      = this,
        messages  = [];

    this.getMessages = function() {
      return messages;
    };

    this.getMessage = function(messageId) {
      if (messages.hasOwnProperty(messageId)) {
        return messages[messageId].message;
      }

      return false;
    };

    this.getMessageMeta = function(messageId) {
      if (messages.hasOwnProperty(messageId)) {
        return messages[messageId].meta;
      }

      return false;
    };

    this.getMessagesCount = function() {
      return Object.keys(messages).length;
    };

    this.addMessage = function(message, meta) {
      var nextId = messages.push({
          message:  message,
          meta:     meta
      });

      return nextId - 1;
    };

    this.removeMessage = function(messageId) {
      if (messages.hasOwnProperty(messageId)) {
        delete messages[messageId];
      }
    };
  };
})();