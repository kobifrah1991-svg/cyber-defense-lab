"""AlfaMaster Suite — cross-platform security & network orchestrator.

Scope note
----------
This package ships the *defensive / authorized-testing* core of the suite:
localization, OS + hardware detection, and real Nmap orchestration for
network inventory and service discovery on systems you are authorized to
scan.

It deliberately does NOT ship point-and-shoot offensive modules
(wireless deauthentication / DoS injection, deauth-forced handshake
capture, or arbitrary-target credential brute-forcing). Those require an
authorization context the tool cannot establish on its own, and some are
denial-of-service by nature. See README.md for details.
"""

__version__ = "0.1.0"
__all__ = ["i18n", "detect"]
