from railway_sdk import define_railway, project, service

# Last resort for a per-service CaC repo. Prefer one .railway file for the
# project and drop this if you later combine services into that file.
PARTIAL = "kept-worker"

@define_railway
def main(ctx=None):
    kept_worker = service(
        "kept-worker",
        start="npm run worker",
    )
    return project("kept", resources=[kept_worker])
