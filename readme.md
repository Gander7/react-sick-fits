# Advanced React (Sick Fits)

Tutorial project based on Wes Bos's Advanced React course.

## Install (Backend)

- `npm i`
- `npm i -g prisma`
- `prisma login`
- create `variables.env` from `variables.env.sample`
- replace {PRISMA_ENDPOINT} with endpoint from `app.prisma.io`
- Change {PRISMA_SECRET} and {APP_SECRET} to random strings
- `npm run dev`

**NOTE**: I encountered a "token expired" error when trying to access the prisma
endpoint on my new computer. Had to create a new service and migrate the data.

## Install (Frontend)

- `npm i && npm run dev`
