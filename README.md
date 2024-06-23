# Next-Hdlr

A HTTP route method utility for Next.js 12 api handlers.

## Use Case

Do you often find yourself creating large switch statements when creating a new API in Next.js?

```js
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case "GET":
        await GET(req, res);
        break;
      case "POST":
        await POST(req, res);
        break;
      case "PATCH":
        await PATCH(req, res);
        break;
      case "PUT":
        await PUT(req, res);
        break;
      case "DELETE":
        await DELETE(req, res);
        break;
      default:
        res.setHeader("Allow", ["GET", "POST", "PATCH", "PUT", "DELETE"]);
        return res
          .status(ResponseStatus.MethodNotAllowed)
          .send("Method Not Allowed");
    }
  } catch (e: any) {
    return res
      .status(ResponseStatus.InternalServerError)
      .send("Internal Server Error");
  }
}

// Handlers ...
```

If so, Next-Hdlr Is the perfect utility for you, as you can take all that boiler plate and narrow it down to:

```js
const handler = new RouteHandler();

// method handlers ...
handler.GET((req, res) => {});

handler.POST((req, res) => {});

handler.PATCH((req, res) => {});

handler.PUT((req, res) => {});

handler.DELETE((req, res) => {});

export default handler.build();
```

Ahh yes, much cleaner 🥤

## Basic Usage

Let's take a look at how to use Next-Hdlr for your next or current project.

### Install

First you will need to add it to your project. Next-Hdlr only supports Next.js versions 9.0.0 and up.

```shell
npm i next-hdlr
```

### Creating a Route Handler

You can configure individual routes using the RouteHandler class. This class allows you to define handlers for different [HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) like `GET`, `POST`, `PUT`, `PATCH`, and `DELETE`.

Here’s how you set up a simple API handler within the `/pages/api` directory:

```js
import { Handler } from "next-hdlr";

const handler = new RouteHandler();

// Define endpoints
handler.GET((req, res) => {
  res.status(200).json({ message: "GET request success" });
});

handler.POST((req, res) => {
  res.status(201).json({ message: "POST request success" });
});
```

### Exporting Your Handler

After defining all the routes, use the `build()` method to create your route handler:

```js
export default handler.build();
```

### TypeScript

To leverage intellisense and improve the DX, pass your expected type to the method handler. This way, you can take full advantage of TypeScript's powerful type inference.

```ts
interface POSTRequestPayload {
  data: string;
}

interface POSTResponsePayload {
  message: string;
}

handler.POST<POSTPayload, POSTResponsePayload>((req, res) => {
  console.log(req.body.data);

  res.status(200).json({ message: "`data` is defined!" });
});
```

Please note that methods `GET` and `DELETE` only take a response generics while methods `POST`, `PATCH`, and `PUT` have both request and response payload generics. See [RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231).

## Issues

If you find that something is not right with the API please create a new issue. Contributions are also welcome!
