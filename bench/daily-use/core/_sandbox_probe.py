"""The self-test probe. It runs INSIDE the sandbox, never on the host.

``sandbox.py`` sends this file's text to the sandboxed interpreter on standard
input, followed by one line that calls ``_main`` with a JSON configuration.

The probe is fixed and benign. It tries the things a sandbox must stop and
reports plain facts about what happened; the host decides whether each one was
contained. It tries to:

* list the root, ``/mnt``, ``/mnt/c`` and ``/mnt/w``;
* read each host path the caller gave (in several mounted spellings);
* see a named environment variable set on the host;
* write a file under ``/usr``;
* open a TCP connection to each given address;
* start more child processes than the limit allows;
* write a 100 MB file;
* allocate 1 GB of memory.

Each risky attempt runs in a child process, so that being killed for it is a
result and not the end of the report. Standard library only, POSIX only.
"""
import json
import os
import select
import signal
import socket
import sys
import time


def _in_child(work, seconds=30):
    """Run ``work`` in a forked child; return its result, or how it died."""
    try:
        read_end, write_end = os.pipe()
        pid = os.fork()
    except OSError as exc:
        return {"fork_failed": type(exc).__name__}
    if pid == 0:
        try:
            os.close(read_end)
            os.write(write_end, json.dumps(work()).encode("utf-8"))
        except BaseException as exc:
            try:
                os.write(write_end, json.dumps({"exception": type(exc).__name__}).encode("utf-8"))
            except BaseException:
                pass
        os._exit(0)
    os.close(write_end)
    data = b""
    deadline = time.time() + seconds
    while time.time() < deadline:
        ready, _, _ = select.select([read_end], [], [], 0.5)
        if ready:
            chunk = os.read(read_end, 65536)
            if not chunk:
                break
            data += chunk
    os.close(read_end)
    try:
        os.kill(pid, signal.SIGKILL)
    except OSError:
        pass
    try:
        _, status = os.waitpid(pid, 0)
    except OSError:
        status = 0
    if data:
        try:
            return json.loads(data.decode("utf-8"))
        except ValueError:
            pass
    return {"died": os.WTERMSIG(status) if os.WIFSIGNALED(status) else -1}


def _list(path):
    try:
        return {"listed": sorted(os.listdir(path))[:60]}
    except OSError as exc:
        return {"listed": None, "error": type(exc).__name__}


def _read(path):
    try:
        with open(path, "rb") as handle:
            return {"readable": True, "size": len(handle.read(4096))}
    except OSError as exc:
        return {"readable": False, "error": type(exc).__name__}


def _write(path):
    try:
        with open(path, "w") as handle:
            handle.write("x")
        os.unlink(path)
        return {"written": True}
    except OSError as exc:
        return {"written": False, "error": type(exc).__name__}


def _tcp(host, port):
    try:
        with socket.create_connection((host, port), timeout=3):
            return {"connected": True}
    except OSError as exc:
        return {"connected": False, "error": type(exc).__name__}


def _spawn(limit):
    children = []
    error = None
    try:
        for _ in range(limit):
            try:
                pid = os.fork()
            except OSError as exc:
                error = type(exc).__name__
                break
            if pid == 0:
                try:
                    time.sleep(60)
                finally:
                    os._exit(0)
            children.append(pid)
    finally:
        for pid in children:
            try:
                os.kill(pid, signal.SIGKILL)
            except OSError:
                pass
        for pid in children:
            try:
                os.waitpid(pid, 0)
            except OSError:
                pass
    return {"spawned": len(children), "error": error}


def _big_file(megabytes):
    path = "/tmp/dtd-probe-big"
    written = 0
    error = None
    try:
        signal.signal(signal.SIGXFSZ, signal.SIG_IGN)
    except (OSError, ValueError, AttributeError):
        pass
    block = b"\0" * (1024 * 1024)
    try:
        with open(path, "wb") as handle:
            for _ in range(megabytes):
                handle.write(block)
                handle.flush()
                written += 1
    except OSError as exc:
        error = type(exc).__name__
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass
    return {"written_mb": written, "error": error}


def _allocate(megabytes):
    try:
        with open("/proc/self/oom_score_adj", "w") as handle:
            handle.write("1000")
    except OSError:
        pass
    try:
        block = bytearray(megabytes * 1024 * 1024)
        for index in range(0, len(block), 4096):
            block[index] = 1
    except MemoryError:
        return {"allocated": False, "error": "MemoryError"}
    return {"allocated": True}


def _main(config_text):
    config = json.loads(config_text)
    out = os.dup(1)
    facts = {"started": True}
    os.write(out, b'{"started": true}\n')
    facts["uid"] = os.getuid()
    facts["env_names"] = sorted(os.environ)[:80]
    facts["env_seen"] = config["env_name"] in os.environ
    facts["list"] = dict((path, _list(path)) for path in config["list_paths"])
    facts["read"] = dict((path, _read(path)) for path in config["read_paths"])
    facts["write"] = dict((path, _write(path)) for path in config["write_paths"])
    facts["tcp"] = dict(("%s:%d" % (host, port), _in_child(lambda h=host, p=port: _tcp(h, p), 10))
                        for host, port in config["tcp_targets"])
    facts["spawn"] = _spawn(config["spawn_attempts"])
    facts["file"] = _in_child(lambda: _big_file(config["file_mb"]), 60)
    facts["alloc"] = _in_child(lambda: _allocate(config["alloc_mb"]), 60)
    os.write(out, (json.dumps(facts) + "\n").encode("utf-8"))
    sys.stdout.flush()
    os._exit(0)
