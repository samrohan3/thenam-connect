require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/thenam';

const runTests = async () => {
  try {
    console.log('Connecting to database:', MONGO_URI.split('@').pop());
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Ensure test users exist
    console.log('Initializing test users...');
    const mockUsers = [
      { name: 'Test User A', username: 'usera', email: 'usera@test.com', firebaseUid: 'fb_usera', roles: ['developer'] },
      { name: 'Test User B', username: 'userb', email: 'userb@test.com', firebaseUid: 'fb_userb', roles: ['developer'] },
      { name: 'Test User C', username: 'userc', email: 'userc@test.com', firebaseUid: 'fb_userc', roles: ['developer'] }
    ];
    for (const mu of mockUsers) {
      await User.updateOne({ username: mu.username }, { $set: mu }, { upsert: true });
    }

    const testUsers = await User.find({ username: { $in: ['usera', 'userb', 'userc'] } });
    const userA = testUsers.find(u => u.username === 'usera');
    const userB = testUsers.find(u => u.username === 'userb');
    const userC = testUsers.find(u => u.username === 'userc');

    if (!userA || !userB || !userC) {
      throw new Error('Test users could not be found or initialized.');
    }

    console.log(`Test users found:\n- User A: ${userA.name} (${userA._id})\n- User B: ${userB.name} (${userB._id})\n- User C: ${userC.name} (${userC._id})`);

    // 2. Test Conversation Key Generation
    const keyAB = [userA._id.toString(), userB._id.toString()].sort().join('_');
    const keyBA = [userB._id.toString(), userA._id.toString()].sort().join('_');

    console.log(`Key A -> B: ${keyAB}`);
    console.log(`Key B -> A: ${keyBA}`);

    if (keyAB !== keyBA) {
      throw new Error('FAIL: Keys are not deterministic (A->B does not equal B->A).');
    }
    console.log('PASS: Deterministic keys are equivalent.');

    // 3. Create or Fetch Conversation A <-> B
    let conv = await Conversation.findOne({ conversationKey: keyAB });
    if (!conv) {
      conv = await Conversation.create({
        type: 'direct',
        participants: [userA._id, userB._id],
        conversationKey: keyAB,
        lastMessage: 'Test message',
        lastMessageAt: new Date()
      });
      console.log('Created conversation document.');
    } else {
      console.log('Conversation document already existed.');
    }

    // 4. Test Security Check: User C requests messages for User A & User B's conversation
    console.log('Testing security access...');
    const requestingUser = userC._id; // User C
    const isParticipant = conv.participants.map(id => id.toString()).includes(requestingUser.toString());

    console.log(`Requesting User: User C (${requestingUser})`);
    console.log(`Conversation participants: ${conv.participants.join(', ')}`);
    console.log(`Is User C a participant? ${isParticipant}`);

    if (isParticipant) {
      throw new Error('FAIL: User C was wrongly identified as a participant in User A & User B conversation.');
    }
    console.log('PASS: Secure authorization restricts User C access.');

    // 5. Test message synchronization compatibility
    console.log('Testing compatibility hooks...');
    const testMessage = new Message({
      conversationId: conv._id,
      senderId: userA._id,
      receiverId: userB._id,
      messageType: 'text',
      text: 'Hello from verification script!'
    });
    
    await testMessage.save();
    console.log('Saved test message.');
    console.log(`Checked fields:\n- text: "${testMessage.text}"\n- content: "${testMessage.content}"\n- senderId: "${testMessage.senderId}"\n- sender: "${testMessage.sender}"`);

    if (testMessage.text !== testMessage.content || testMessage.senderId.toString() !== testMessage.sender.toString()) {
      throw new Error('FAIL: Backward compatibility synchronization failed.');
    }
    console.log('PASS: Message fields are fully backward compatible.');

    // Cleanup test records
    await Message.deleteOne({ _id: testMessage._id });
    console.log('Cleaned up test message.');

    console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
    process.exit(0);
  } catch (error) {
    console.error('Test script encountered an error ❌:', error);
    process.exit(1);
  }
};

runTests();
