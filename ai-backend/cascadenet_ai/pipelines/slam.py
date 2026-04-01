from __future__ import annotations

from ..types import CameraPose


def estimate_camera_poses(pose_track: list[CameraPose]) -> list[CameraPose]:
    """A minimal SLAM-facing interface.

    In production this is where ORB-SLAM3 stereo tracking would feed optimized poses.
    For the repo we preserve the contract and return the synthetic stabilized track.
    """

    return pose_track
