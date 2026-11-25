Firebase Hosting needs a public directory. This one stays empty on purpose:
every request is rewritten to the tronswan Cloud Run service (see firebase.json),
which serves the React build itself.
