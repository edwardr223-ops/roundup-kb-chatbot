import json
import os
import boto3

bedrock_agent_runtime = boto3.client("bedrock-agent-runtime", region_name=os.environ["AWS_REGION"])

KNOWLEDGE_BASE_ID = os.environ["KNOWLEDGE_BASE_ID"]
MODEL_ARN = os.environ["MODEL_ARN"]

def _response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body)
    }

def lambda_handler(event, context):
    try:
        http_method = event.get("requestContext", {}).get("http", {}).get("method") or event.get("httpMethod")

        if http_method == "OPTIONS":
            return _response(200, {"ok": True})

        body = event.get("body")
        if isinstance(body, str):
            body = json.loads(body)
        elif body is None:
            body = {}

        question = (body.get("message") or "").strip()
        session_id = body.get("sessionId")

        if not question:
            return _response(400, {"error": "message is required"})

        request = {
            "input": {
                "text": question
            },
            "retrieveAndGenerateConfiguration": {
                "type": "KNOWLEDGE_BASE",
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN
                }
            }
        }

        if session_id:
            request["sessionId"] = session_id

        result = bedrock_agent_runtime.retrieve_and_generate(**request)

        output_text = result.get("output", {}).get("text", "")
        returned_session_id = result.get("sessionId")

        citations = []
        for citation in result.get("citations", []):
            generated_text_part = citation.get("generatedResponsePart", {})
            retrieved_references = citation.get("retrievedReferences", [])

            citation_text = (
                generated_text_part
                .get("textResponsePart", {})
                .get("text", "")
            )

            refs = []
            for ref in retrieved_references:
                location = ref.get("location", {})
                content = ref.get("content", {})
                metadata = ref.get("metadata", {})

                ref_item = {
                    "text": content.get("text", ""),
                    "metadata": metadata
                }

                if "s3Location" in location:
                    ref_item["uri"] = location["s3Location"].get("uri", "")

                refs.append(ref_item)

            citations.append({
                "generatedText": citation_text,
                "references": refs
            })

        return _response(200, {
            "answer": output_text,
            "sessionId": returned_session_id,
            "citations": citations
        })

    except Exception as e:
        return _response(500, {
            "error": str(e)
        })
