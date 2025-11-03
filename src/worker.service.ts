import {Injectable} from '@nestjs/common';
import {PrismaService} from './prisma.service';
import {Job, JobStatus} from 'generated/prisma';
import {runDockerImage} from "./utils/runDockerImage";

@Injectable()
export class WorkerService {
    constructor(private prisma: PrismaService) {}

    // async startParseJob(): Promise<Job> {
    //     const job = await this.prisma.job.create({
    //         data: {
    //             status: JobStatus.PENDING
    //         }
    //     });
    //
    //     return job;
    // }

    async startParseJob(): Promise<Job> {

        const id = new Date().valueOf();
        const image = "extractor-worker-image";
        const name = `worker-${id}`;
        const env = {};

        const workerOne = await runDockerImage(name, image, env);

        workerOne.done.then(async (code) => {
            console.log(`Worker ${name} exited with code ${code}`);
        })
        const name2 = `worker-${id+1}`;
        const worker2 = await runDockerImage(name2, image, env);

        worker2.done.then(async (code) => {
            console.log(`Worker ${name2} exited with code ${code}`);
        })

        return {
            id: id,
            bookUrl: null,
            status: JobStatus.PENDING,
            resultUrl: null,
            message: null,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    }
}
