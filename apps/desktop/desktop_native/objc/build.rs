fn main() {
    cc::Build::new()
        .file("src/native/commands/status.m")
        .file("src/native/commands/sync.m")
        .file("src/native/utils.m")
        .file("src/native/autofill.m")
        .flag("-fobjc-arc") // Enable Auto Reference Counting (ARC)
        .compile("autofill");
    println!("cargo::rerun-if-changed=src/native/commands/status.m");
    println!("cargo::rerun-if-changed=src/native/commands/sync.m");
    println!("cargo::rerun-if-changed=src/native/utils.m");
    println!("cargo::rerun-if-changed=src/native/autofill.m");
}
