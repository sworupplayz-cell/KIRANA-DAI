# Provisional road atlas

`colormap.png` is required by every uploaded City Kit Roads GLB at the exact case-sensitive relative path `Textures/colormap.png`.

The original City Kit Roads atlas was not included in the repository upload and does not exist elsewhere in the current repository or its reachable history. To keep the audited road geometry visible, this file is temporarily a byte-for-byte copy of:

`public/assets/environment/buildings/Textures/colormap.png`

SHA-256 for both files:

`9b5de86078c25ef02351a80d35ff3c978693a1044565b73eedd9ae9b5b80665d`

This fallback is visually compatible enough for the development audit, but it is **not approved as the final road atlas**. Restore the intended, licensed City Kit Roads `Textures/colormap.png` before final environment work. Do not redesign road materials or replace this file with generated imagery as a workaround.
