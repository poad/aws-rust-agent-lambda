use lambda_http::{Body, Error, Request, Response};
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize)]
struct RequestBody {
    message: String,
}

pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    let body = event.body();
    let s = std::str::from_utf8(body).expect("invalid utf-8 sequence");
    let request = match serde_json::from_str::<RequestBody>(s) {
        Ok(request) => request,
        Err(err) => {
            let message = json!({ "message": err.to_string() }).to_string();
            let resp = Response::builder()
                .status(400)
                .header("content-type", "application/json")
                .body(message.into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
    };

    let response_body = json!({ "message": format!("hello {}", request.message) });
    let resp = Response::builder()
        .status(200)
        .header("content-type", "application/json")
        .body(response_body.to_string().into())
        .map_err(Box::new)?;
    Ok(resp)
}
