FROM ubuntu:jammy

WORKDIR /ledger

RUN apt -y update && apt -y install git curl libssl-dev libudev-dev pkg-config zlib1g-dev llvm clang cmake make libprotobuf-dev protobuf-compiler

RUN curl -sSf https://sh.rustup.rs | sh -s -- -y

RUN git clone https://github.com/solana-labs/solana.git --depth 1 --branch v1.18 /solana-src-v1.18

ENV PATH="/root/.cargo/bin:${PATH}"

RUN /solana-src-v1.18/scripts/cargo-install-all.sh /.local/share/solana/install/releases/1.18

ENV PATH="/.local/share/solana/install/releases/1.18/bin:${PATH}"

RUN solana config set -u localhost

COPY ./run.sh /run.sh
COPY ./monitor.sh /monitor.sh

RUN chmod +x /run.sh
RUN chmod +x /monitor.sh

RUN apt -y install fswatch

# start a solana test validator but output logs to 
CMD ["sh", "-c", "/monitor.sh"]
