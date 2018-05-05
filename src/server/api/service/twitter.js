import OAuth from 'oauth';
import Connection from '../models/Connection';

// Plor Twitter info
const oauthToken = 'UWQ2xMGVAUgLvjslljpjyrnaa';
const oauthTokenSecret = '8sfT2zKZJ0bAR24EMkBdMVGtP3MBp6IpnblPBqZ0hSK0OQCwvN';

// Configure oauth
const oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  oauthToken,
  oauthTokenSecret,
  '1.0A',
  'http://localhost:3000/api/connections/twitter/callback',
  'HMAC-SHA1'
);

export const twitter = {
  async get(req, res) {
    try {
      oauth.getOAuthRequestToken(
        (error, oauthToken, oauthTokenSecret, results) => {
          if (error) {
            console.log(error);
            res.send('Authentication Failed!');
          } else {
            req.session.oauth = {
              token: oauthToken,
              tokenSecret: oauthTokenSecret
            };
            res.redirect(
              'https://twitter.com/oauth/authenticate?oauth_token=' + oauthToken
            );
          }
        }
      );
    } catch (error) {
      res.handleServerError(error);
    }
  },

  async callback(req, res) {
    if (req.session.oauth && req.user.email) {
      req.session.oauth.verifier = req.query['oauth_verifier'];
      const oauthData = req.session.oauth;

      await oauth.getOAuthAccessToken(
        oauthData.token,
        oauthData.tokenSecret,
        oauthData.verifier,
        async (error, oauthAccessToken, oauthAccessTokenSecret, results) => {
          if (error) {
            console.log(error);
            res.send('Authentication Failure!');
          } else {
            req.session.oauth.accessToken = oauthAccessToken;
            req.session.oauth.accessTokenSecret = oauthAccessTokenSecret;
            console.log(req.session.oauth);
            const newConnection = new Connection({
              type: 'twitter',
              oauth: req.session.oauth
            });
            const connection = await newConnection.save();
            res.redirect('/manage');
          }
        }
      );
    } else {
      res.redirect('/auth/login');
    }
  }
};
