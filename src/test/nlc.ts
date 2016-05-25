import chai = require('chai');
const spies = require('chai-spies');

import NLC from '../NaturalLanguageCommander';
import Deferred from '../lib/Deferred';

chai.use(spies);
const expect = chai.expect;

/** Expect a command to get a match. */
function expectCommandToMatch(nlc: NLC, command: string, matchCallback, noMatchCallback, done) {
  nlc.handleCommand(command)
    .catch(noMatchCallback)
    .then(() => {
      expect(matchCallback).to.have.been.called();
      expect(noMatchCallback).not.to.have.been.called();
      done();
    })
    .catch((error) => done(error));
}

/** Expect a command not to get a match. */
function expectCommandToNotMatch(nlc: NLC, command: string, matchCallback, noMatchCallback, done) {
  nlc.handleCommand(command)
    .catch(noMatchCallback)
    .then(() => {
      expect(matchCallback).not.to.have.been.called();
      expect(noMatchCallback).to.have.been.called();
      done();
    })
    .catch((error) => done(error));
}

describe('basic commands', () => {
  let nlc: NLC;
  let matchCallback;
  let noMatchCallback;

  beforeEach(() => {
    nlc = new NLC();

    matchCallback = chai.spy();
    noMatchCallback = chai.spy();

    // Register a simple intent.
    nlc.registerIntent({
      intent: 'TEST',
      callback: matchCallback,
      utterances: [
        'test'
      ]
    });
  });

  it('should match a simple input', (done) => {
    expectCommandToMatch(nlc, 'test', matchCallback, noMatchCallback, done);
  });

  it('should not match a simple bad input', (done) => {
     expectCommandToNotMatch(nlc, 'tset', matchCallback, noMatchCallback, done);
  });
});

describe('slot types', () => {
  let nlc: NLC;
  let matchCallback;
  let noMatchCallback;

  beforeEach(() => {
    nlc = new NLC();

    matchCallback = chai.spy();
    noMatchCallback = chai.spy();
  });

  describe('STRING', () => {
    beforeEach(() => {
      // Register an intent with a STRING.
      nlc.registerIntent({
        intent: 'STRING_TEST',
        callback: matchCallback,
        slots: [
          {
            name: 'String',
            type: 'STRING'
          }
        ],
        utterances: [
          'test {String} test'
        ]
      });
    });

    it('should match a string slot', (done) => {
      expectCommandToMatch(nlc, 'test this is a string test', matchCallback, noMatchCallback, done);
    });

    it('should not match a bad string slot', (done) => {
      expectCommandToNotMatch(nlc, 'test test', matchCallback, noMatchCallback, done);
    });
  });

  describe('DATE', () => {
    beforeEach(() => {
      // Register an intent with a STRING.
      nlc.registerIntent({
        intent: 'DATE_TEST',
        callback: matchCallback,
        slots: [
          {
            name: 'Date',
            type: 'DATE'
          }
        ],
        utterances: [
          'test {Date} test'
        ]
      });
    });
    
    it('should match a date slot with a MM/DD/YYYY date', (done) => {
      expectCommandToMatch(nlc, 'test 10/10/2016 test', matchCallback, noMatchCallback, done);
    });

    it('should match a date slot with a YYYY-MM-DD date', (done) => {
      expectCommandToMatch(nlc, 'test 2016-10-10 test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with a MMM DD, YYYY date', (done) => {
      expectCommandToMatch(nlc, 'test Oct 10, 2016 test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with a MMMM DD, YYYY date', (done) => {
      expectCommandToMatch(nlc, 'test October 10, 2016 test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with "today"', (done) => {
      expectCommandToMatch(nlc, 'test today test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with "tomorrow"', (done) => {
      expectCommandToMatch(nlc, 'test tomorrow test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with "yesterday"', (done) => {
      expectCommandToMatch(nlc, 'test yesterday test', matchCallback, noMatchCallback, done);
    });
    
    it('should match a date slot with other strings', (done) => {
      expectCommandToNotMatch(nlc, 'test foobar test', matchCallback, noMatchCallback, done);
    });
  });
  
  describe('SLACK_NAME', () => {
    beforeEach(() => {
      // Register an intent with a STRING.
      nlc.registerIntent({
        intent: 'SLACK_NAME_TEST',
        callback: matchCallback,
        slots: [
          {
            name: 'Name',
            type: 'SLACK_NAME'
          }
        ],
        utterances: [
          'test {Name} test'
        ]
      });
    });

    it('should match a name slot', (done) => {
      expectCommandToMatch(nlc, 'test @test test', matchCallback, noMatchCallback, done);
    });

    it('should not match a bad name slot', (done) => {
      expectCommandToNotMatch(nlc, 'test test test', matchCallback, noMatchCallback, done);
    });
  });
  
  describe('SLACK_ROOM', () => {
    beforeEach(() => {
      // Register an intent with a STRING.
      nlc.registerIntent({
        intent: 'SLACK_ROOM_TEST',
        callback: matchCallback,
        slots: [
          {
            name: 'Room',
            type: 'SLACK_ROOM'
          }
        ],
        utterances: [
          'test {Room} test'
        ]
      });
    });

    it('should match a room slot', (done) => {
      expectCommandToMatch(nlc, 'test #test test', matchCallback, noMatchCallback, done);
    });

    it('should match a name slot', (done) => {
      expectCommandToMatch(nlc, 'test @test test', matchCallback, noMatchCallback, done);
    });

    it('should not match a bad room slot', (done) => {
      expectCommandToNotMatch(nlc, 'test test test', matchCallback, noMatchCallback, done);
    });
  });
});