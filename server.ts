import { Application, send, Router, REDIRECT_BACK } from "https://deno.land/x/oak/mod.ts";
import { viewEngine, engineFactory, adapterFactory, ViewConfig } from 'https://deno.land/x/view_engine/mod.ts';

import { Client } from "https://deno.land/x/mysql/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

import { createHash } from "https://deno.land/std@0.77.0/hash/mod.ts";

const port = 3000;
const app = new Application();
const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

const session = new Session();
const router = new Router();

app.use(viewEngine(oakAdapter, ejsEngine, {
	viewRoot: "./views",
	viewExt: ".ejs",
}));

app.use(session.initMiddleware());

async function check_auth(ctx: any, next: any) {
	let result = await ctx.state.session.get("userId");
	if(!result) {
		ctx.response.body = "you are not logged in";
	} else {
		next();
	}
}

function check_injection(str : string) {
	return str.match(/[\t\r\n]|(--[^\r\n]*)|(\/\*[\w\W]*?(?=\*)\*\/)/gi);
}


router.get('/', async (ctx : any, next) => {
	ctx.render("index", {
		user: {
			id: await ctx.state.session.get("userId"),
			name: await ctx.state.session.get("userName")
		}
	});
});

router.get('/login', async (ctx : any, next) => {
	ctx.render("login");
});

router.post('/login/attempt', async(ctx: any, next) => {
	const body = await ctx.request.body().value;
	const user = body.get("user");
	const pass = body.get("password");

	if(check_injection(user)) {
		ctx.response.body = "0";
		return;
	}

	const users = (await client.query(`select UserId, UserName, PasswordHash from shop.users where UserName='${user}'`))[0];

	if(!users || users.UserId == null) {
		ctx.response.body = "0";
		return;
	}

	const hash = createHash("sha256");
	hash.update(pass);
	const passwordHash = hash.toString();
	if(passwordHash === users.PasswordHash) {
		ctx.response.body = "1";
		ctx.state.session.set("userId", users.UserId);
		ctx.state.session.set("userName", users.UserName);
	} else {
		ctx.response.body = "0";
	}
});

router.get('/logout', async (ctx : any, next) => {
	ctx.state.session.deleteSession();
	ctx.response.redirect("/");
});

app.addEventListener('listen', () => {
	console.log(`Listening on port ${port}`);
});

app.use(router.routes());
app.use(router.allowedMethods());

// Send static content
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/public/`,
    //index: "index.html",
  });
});

const decoder = new TextDecoder('utf-8');
const env_data = decoder.decode(await Deno.readFile('env.json'));
const env = JSON.parse(env_data);

const client = await new Client().connect(env.database);


const users = await client.query(`select * from shop.users`);

await app.listen({
	port: port
});

