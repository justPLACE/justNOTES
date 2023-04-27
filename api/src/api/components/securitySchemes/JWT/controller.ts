import jwt from "jsonwebtoken";
import ono from "ono";
import { security } from "../../../../functions/controller";
import MongoDBDataStore from "../../../../functions/mongodb.datastore";

export enum JWT_REQUIREMENTS {
  ADMIN = "admin",
  OWNER = "owner",
}

const ADMINS = ((global as any).it ? "admin" : process.env.ADMINS || "")
  .toLowerCase()
  .split(",");

export default security(
  async (req, _res, next) => {
    const { requirements, apiKey } = (req as any).security as {
      requirements?: string[];
      apiKey?: any;
    };
    delete (req as any).security;
    if (!(global as any).it) {
      if (typeof apiKey === "string") {
        try {
          (req as any).id = jwt.verify(apiKey, process.env.JWT_SECRET!);
        } catch (e) {
          return next(
            ono(
              {
                status: 401,
                reason: {
                  ...(e as Error),
                  message: (e as Error).message,
                  stack: (e as Error).stack,
                },
              },
              "Invalid JWT"
            )
          );
        }
      } else {
        return next(
          ono(
            {
              status: 401,
            },
            "Missing JWT"
          )
        );
      }
    } else {
      (req as any).id = { email: apiKey };
    }
    (req as any).id.isAdmin = ADMINS.indexOf((req as any).id.email) !== -1;
    ((req as any).dataStore as MongoDBDataStore).validate = (
      resource,
      _db,
      resourceBefore
    ) => {
      if (
        (!requirements?.includes(JWT_REQUIREMENTS.ADMIN) ||
          !(req as any).id.isAdmin) &&
        (!resourceBefore ||
          !requirements?.includes(JWT_REQUIREMENTS.OWNER) ||
          resourceBefore.owner !== (req as any).id.email) &&
        (requirements?.includes(JWT_REQUIREMENTS.ADMIN) ||
          (resourceBefore && requirements?.includes(JWT_REQUIREMENTS.OWNER)))
      ) {
        throw ono(
          {
            status: 403,
          },
          "You don't have permission"
        );
      }
      if (resource) {
        resource.owner = (req as any).id?.email;
      }
    };
    ((req as any).dataStore as MongoDBDataStore).db2api = (resource) => {
      if (
        (!requirements?.includes(JWT_REQUIREMENTS.ADMIN) ||
          !(req as any).id.isAdmin) &&
        (!requirements?.includes(JWT_REQUIREMENTS.OWNER) ||
          resource.owner !== (req as any).id.email) &&
        (requirements?.includes(JWT_REQUIREMENTS.ADMIN) ||
          requirements?.includes(JWT_REQUIREMENTS.OWNER))
      ) {
        return;
      }
      return Object.assign({}, resource, {
        data: {
          ...resource.data,
          isOwner:
            (req as any).id.isAdmin || resource.owner === (req as any).id.email,
          owner: (req as any).id.isAdmin ? resource.owner : undefined,
        },
      });
    };
    return next();
  },
  () => {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT secret");
    }
  }
);
