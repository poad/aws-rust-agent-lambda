use lambda_http::{Body, Error, Request, Response};
use serde::Deserialize;
use serde_json::json;

#[path = "./rag.rs"]
mod rag;

#[derive(Deserialize)]
struct RequestBody {
    message: String,
}

pub(crate) async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    // Extract some useful information from the request
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
    let message = request.message;

    let rag_resp = rag::handle(message.as_str()).await;
    return match rag_resp {
        Err(err) => {
            let message = json!({ "message": err.to_string() }).to_string();
            let resp = Response::builder()
                .status(500)
                .header("content-type", "application/json")
                .body(message.into())
                .map_err(Box::new)?;
            return Ok(resp);
        }
        Ok(message) => {
            let response_body = json!({ "message": message });
            // Return something that implements IntoResponse.
            // It will be serialized to the right response event automatically by the runtime
            let resp = Response::builder()
                .status(200)
                .header("content-type", "application/json")
                .body(response_body.to_string().into())
                .map_err(Box::new)?;
            Ok(resp)
        }
    }
}
